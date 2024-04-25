import React, { useEffect } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from 'rive-react';

const STATE_MACHINE_NAME = 'State Machine 1';

const Teddy = ({ action }) => {
    const { RiveComponent, rive: riveInstance } = useRive({
        src: '/login.riv',
        stateMachines: STATE_MACHINE_NAME,
        autoplay: true,
        layout: new Layout({
            fit: Fit.Cover,
            alignment: Alignment.Center,
        }),
    });

    // Rive animation states
    const trigSuccessInput = useStateMachineInput(riveInstance, STATE_MACHINE_NAME, 'success');
    const trigFailInput = useStateMachineInput(riveInstance, STATE_MACHINE_NAME, 'fail');
    const isHandsUpInput = useStateMachineInput(riveInstance, STATE_MACHINE_NAME, 'hands_up');
    const isCheckingInput = useStateMachineInput(riveInstance, STATE_MACHINE_NAME, 'isChecking');

    useEffect(() => {
        switch (action) {
            case "success":
                if (trigSuccessInput) trigSuccessInput.fire();
                break;
            case "fail":
                if (trigFailInput) trigFailInput.fire();
                break;
            case "handsUp":
                if (isHandsUpInput) isHandsUpInput.value = true;
                break;
            case "handsDown":
                if (isHandsUpInput) isHandsUpInput.value = false;
                break;
            case "isChecking":
                if (isCheckingInput) isCheckingInput.fire();
                break;
            default:
                break;
        }
    }, [action, trigSuccessInput, trigFailInput, isHandsUpInput, isCheckingInput]);

    return (
        <div className="character-container">
            <div className="character-circle">
                <RiveComponent className="rive-container" />
            </div>
        </div>
    );
}

export default Teddy;
