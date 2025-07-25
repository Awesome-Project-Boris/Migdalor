import React from "react";
import "ldrs/react/Treadmill.css";
import { Treadmill } from "ldrs/react";

// It's a good practice to register the component once,
// although with React components it's often handled automatically.
// This line is more for vanilla JS usage but doesn't hurt here.
/**
 * A shared loading indicator component.
 * @param {object} props - The component props.
 * @param {string} [props.text='טוען...'] - The text to display below the animation.
 */
const LoadingIndicator = ({ text = "טוען..." }) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-8"
      aria-live="polite"
      aria-busy="true"
    >
      <Treadmill size="70" speed="1.25" color="#3b82f6" />
      <p className="mt-4 text-lg font-semibold text-gray-700">{text}</p>
    </div>
  );
};

export default LoadingIndicator;