"""
MachLock Simulated Cockpit Tools & Asynchronous Action Engine
Simulates procedural aircraft subsystem actuators (Fire bottle discharge, thrust cut, transponder set)
with configurable latency to enable deterministic race condition reproduction.
"""

import asyncio
import uuid
import time
from typing import Dict, Any, Tuple
from app.state.epoch_fencer import EpochFencer
from app.state.models import EventType


class SimulatedCockpitTools:
    """
    Executes synthetic cockpit operations with artificial asynchronous latency.
    Every invocation is stamped with the dispatch epoch_id and validated via the EpochFencer commit fence.
    Only commits state mutation IF the commit fence approves (epoch matches).
    """

    def __init__(self, fencer: EpochFencer):
        self.fencer = fencer

    async def execute_tool_with_delay(
        self,
        action_key: str,
        params: Dict[str, Any],
        delay_ms: int = 500
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Dispatches a simulated actuator tool with an artificial asynchronous delay.
        Validates commit eligibility upon completion against fencer.validate_and_commit_tool_result.
        """
        tool_request_id = f"TOOL-{uuid.uuid4().hex[:6].upper()}"
        dispatch_epoch = self.fencer.state.current_epoch

        # Log dispatch
        self.fencer.audit_store.record_tool_dispatch(
            tool_request_id,
            self.fencer.session_id,
            dispatch_epoch,
            action_key,
            {"params": params, "delay_ms": delay_ms}
        )

        await self.fencer.emit_event(
            EventType.TOOL_DISPATCHED,
            component="SIMULATED_ACTUATOR",
            status="IN_FLIGHT",
            metadata={
                "tool_request_id": tool_request_id,
                "epoch_id": dispatch_epoch,
                "action_key": action_key,
                "delay_ms": delay_ms
            }
        )

        # Simulate asynchronous physical/actuator latency
        await asyncio.sleep(delay_ms / 1000.0)

        # Pass through Commit Fence (Race condition barrier) BEFORE applying state mutations!
        pre_result_payload = {"action": action_key, "params": params}
        is_committed = await self.fencer.validate_and_commit_tool_result(
            tool_request_id=tool_request_id,
            request_epoch=dispatch_epoch,
            action_key=action_key,
            result_payload=pre_result_payload
        )

        if is_committed:
            # Apply synthetic state mutation ONLY if commit fence permitted
            result_payload = self._apply_synthetic_action(action_key, params)
        else:
            result_payload = "STALE_DISCARDED"

        return is_committed, {
            "tool_request_id": tool_request_id,
            "dispatch_epoch": dispatch_epoch,
            "current_epoch": self.fencer.state.current_epoch,
            "committed": is_committed,
            "result": result_payload
        }

    def _apply_synthetic_action(self, action_key: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Mutates simulated cockpit telemetry."""
        telemetry = self.fencer.state.telemetry

        if action_key == "VERIFY_THRUST_LEVER_IDLE":
            engine_id = params.get("engine", 2)
            if engine_id == 2:
                telemetry.thrust_lever_2_pct = 0.0
            else:
                telemetry.thrust_lever_1_pct = 0.0
            return {"status": "SUCCESS", "message": f"Engine {engine_id} thrust lever verified IDLE (0%)"}

        elif action_key == "FIRE_BOTTLE_DISCHARGE":
            bottle_id = params.get("bottle", 1)
            telemetry.fire_bottle_1_discharged = True
            telemetry.engine_2_fire = False
            telemetry.master_warning = False
            return {
                "status": "SUCCESS",
                "message": f"Simulated Fire Bottle {bottle_id} discharged. Engine 2 fire extinguished."
            }

        elif action_key == "SET_TRANSPONDER":
            code = params.get("code", "7700")
            telemetry.transponder_code = code
            return {"status": "SUCCESS", "message": f"Transponder squawk set to {code}"}

        elif action_key == "ARM_FIRE_BOTTLE":
            telemetry.fire_bottle_1_armed = True
            return {"status": "SUCCESS", "message": "Fire Bottle 1 ARMED"}

        return {"status": "SUCCESS", "message": f"Synthetic action {action_key} processed"}
