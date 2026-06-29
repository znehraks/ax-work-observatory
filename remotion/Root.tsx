import { Composition } from "remotion";
import { AgenticTaskAutomationPipeline } from "./AgenticTaskAutomationPipeline";

export const RemotionRoot = () => {
  return (
    <Composition
      id="AgenticTaskAutomationPipeline"
      component={AgenticTaskAutomationPipeline}
      durationInFrames={210}
      fps={30}
      width={1280}
      height={900}
    />
  );
};
