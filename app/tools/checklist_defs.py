"""
MachLock Checklist Definitions & Procedures
Defines standard synthetic cockpit checklist procedures.
"""

from typing import List
from app.state.models import ChecklistStep

ENGINE_FIRE_CHECKLIST: List[ChecklistStep] = [
    ChecklistStep(
        step_number=1,
        action_key="CONFIRM_ENGINE_FIRE_CONDITION",
        title="CONFIRM ENGINE 2 FIRE WARNING",
        spoken_instruction="Confirm master warning and Engine Two fire warning light illuminated.",
        simulated_tool_action="VERIFY_ENGINE_2_FIRE_INDICATION",
        expected_response="CONFIRMED ENGINE TWO FIRE",
        is_active=True
    ),
    ChecklistStep(
        step_number=2,
        action_key="VERIFY_THRUST_LEVER_IDLE",
        title="THRUST LEVER 2 — IDLE",
        spoken_instruction="Confirm thrust lever two idle. Verify N1 and N2 spooling down.",
        simulated_tool_action="VERIFY_THRUST_LEVER_IDLE",
        expected_response="THRUST LEVER TWO IDLE",
        is_active=False
    ),
    ChecklistStep(
        step_number=3,
        action_key="FIRE_BOTTLE_DISCHARGE",
        title="FIRE BOTTLE 1 — DISCHARGE",
        spoken_instruction="Discharge fire bottle one to Engine Two. Start thirty second timer.",
        simulated_tool_action="FIRE_BOTTLE_DISCHARGE",
        expected_response="BOTTLE ONE DISCHARGED",
        is_active=False
    ),
    ChecklistStep(
        step_number=4,
        action_key="SET_TRANSPONDER_MAYDAY",
        title="TRANSPONDER — SQUAWK 7700",
        spoken_instruction="Set transponder squawk seven seven zero zero. Notify air traffic control.",
        simulated_tool_action="SET_TRANSPONDER",
        expected_response="SQUAWKING SEVEN SEVEN ZERO ZERO",
        is_active=False
    )
]
