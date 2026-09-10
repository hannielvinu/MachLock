"""
SQLite Audit Store & Evidence Persistence Ledger
Provides immutable record of all epochs, heard-state transitions, tool fences, and test runs.
"""

import os
import json
import sqlite3
import time
from typing import List, Dict, Any, Optional
from app.state.models import RealtimeEvent, InstructionRecord, RaceTestResult


class AuditStore:
    def __init__(self, db_path: str = "./evidence/machlock_audit.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Sessions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    created_at REAL,
                    current_epoch INTEGER,
                    active_checklist TEXT,
                    is_active INTEGER
                )
            """)

            # Epoch Ledger table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS epoch_ledger (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    epoch_id INTEGER,
                    triggered_by TEXT,
                    reason TEXT,
                    created_at REAL
                )
            """)

            # Instructions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS instructions (
                    instruction_id TEXT PRIMARY KEY,
                    session_id TEXT,
                    epoch_id INTEGER,
                    step_number INTEGER,
                    procedure_name TEXT,
                    text TEXT,
                    heard_state TEXT,
                    heard_percentage REAL,
                    confirmed INTEGER,
                    committed INTEGER,
                    invalidated_reason TEXT,
                    created_at REAL,
                    updated_at REAL
                )
            """)

            # Tool Requests & Invocations
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tool_invocations (
                    tool_request_id TEXT PRIMARY KEY,
                    session_id TEXT,
                    epoch_id INTEGER,
                    action_key TEXT,
                    payload_json TEXT,
                    status TEXT, -- DISPATCHED, COMPLETED, REJECTED_STALE
                    result_json TEXT,
                    dispatched_at REAL,
                    completed_at REAL
                )
            """)

            # Audit Events
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_events (
                    event_id TEXT PRIMARY KEY,
                    session_id TEXT,
                    timestamp REAL,
                    type TEXT,
                    epoch_id INTEGER,
                    instruction_id TEXT,
                    component TEXT,
                    status TEXT,
                    metadata_json TEXT
                )
            """)

            # Test Runs / Evidence
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_runs (
                    test_id TEXT PRIMARY KEY,
                    timestamp REAL,
                    tool_delay_ms INTEGER,
                    initial_epoch INTEGER,
                    interrupted_epoch INTEGER,
                    rime_cancellation_emitted INTEGER,
                    client_invalidation_emitted INTEGER,
                    stale_tool_result_rejected INTEGER,
                    partial_commit_prevented INTEGER,
                    persistent_audit_verified INTEGER,
                    execution_time_ms REAL,
                    status TEXT,
                    details_json TEXT
                )
            """)
            conn.commit()

    def record_session(self, session_id: str, active_checklist: str = "ENGINE_FIRE_SIMULATION"):
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO sessions (session_id, created_at, current_epoch, active_checklist, is_active)
                VALUES (?, ?, 1, ?, 1)
            """, (session_id, time.time(), active_checklist))
            conn.commit()

    def record_epoch_bump(self, session_id: str, epoch_id: int, triggered_by: str, reason: str):
        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO epoch_ledger (session_id, epoch_id, triggered_by, reason, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (session_id, epoch_id, triggered_by, reason, time.time()))
            conn.execute("""
                UPDATE sessions SET current_epoch = ? WHERE session_id = ?
            """, (epoch_id, session_id))
            conn.commit()

    def save_instruction(self, session_id: str, instruction: InstructionRecord):
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO instructions 
                (instruction_id, session_id, epoch_id, step_number, procedure_name, text, heard_state, heard_percentage, confirmed, committed, invalidated_reason, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                instruction.instruction_id,
                session_id,
                instruction.epoch_id,
                instruction.step_number,
                instruction.procedure_name,
                instruction.text,
                instruction.heard_state.value if hasattr(instruction.heard_state, 'value') else str(instruction.heard_state),
                instruction.heard_percentage,
                1 if instruction.confirmed else 0,
                1 if instruction.committed else 0,
                instruction.invalidated_reason,
                instruction.created_at,
                instruction.updated_at
            ))
            conn.commit()

    def record_tool_dispatch(self, tool_request_id: str, session_id: str, epoch_id: int, action_key: str, payload: dict):
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO tool_invocations 
                (tool_request_id, session_id, epoch_id, action_key, payload_json, status, dispatched_at)
                VALUES (?, ?, ?, ?, ?, 'DISPATCHED', ?)
            """, (tool_request_id, session_id, epoch_id, action_key, json.dumps(payload), time.time()))
            conn.commit()

    def record_tool_completion(self, tool_request_id: str, status: str, result: dict):
        with self._get_connection() as conn:
            conn.execute("""
                UPDATE tool_invocations
                SET status = ?, result_json = ?, completed_at = ?
                WHERE tool_request_id = ?
            """, (status, json.dumps(result), time.time(), tool_request_id))
            conn.commit()

    def record_event(self, session_id: str, event: RealtimeEvent):
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO audit_events 
                (event_id, session_id, timestamp, type, epoch_id, instruction_id, component, status, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.event_id,
                session_id,
                event.timestamp,
                event.type.value if hasattr(event.type, 'value') else str(event.type),
                event.epoch_id,
                event.instruction_id,
                event.component,
                event.status,
                json.dumps(event.metadata)
            ))
            conn.commit()

    def record_test_run(self, result: RaceTestResult):
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO test_runs
                (test_id, timestamp, tool_delay_ms, initial_epoch, interrupted_epoch, rime_cancellation_emitted,
                 client_invalidation_emitted, stale_tool_result_rejected, partial_commit_prevented,
                 persistent_audit_verified, execution_time_ms, status, details_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                result.test_id,
                result.timestamp,
                result.tool_delay_ms,
                result.initial_epoch,
                result.interrupted_epoch,
                1 if result.rime_cancellation_emitted else 0,
                1 if result.client_invalidation_emitted else 0,
                1 if result.stale_tool_result_rejected else 0,
                1 if result.partial_commit_prevented else 0,
                1 if result.persistent_audit_verified else 0,
                result.execution_time_ms,
                result.status,
                json.dumps(result.details)
            ))
            conn.commit()

    def get_events(self, session_id: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            if session_id:
                cursor = conn.execute("""
                    SELECT * FROM audit_events WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?
                """, (session_id, limit))
            else:
                cursor = conn.execute("""
                    SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT ?
                """, (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_instructions(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            if session_id:
                cursor = conn.execute("SELECT * FROM instructions WHERE session_id = ? ORDER BY step_number ASC", (session_id,))
            else:
                cursor = conn.execute("SELECT * FROM instructions ORDER BY created_at DESC LIMIT 50")
            return [dict(row) for row in cursor.fetchall()]

    def get_test_runs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM test_runs ORDER BY timestamp DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]
