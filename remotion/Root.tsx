import { Composition } from "remotion";
import { AgenticTaskAutomationPipeline } from "./AgenticTaskAutomationPipeline";
import {
  AgentConversationLoggerPipeline,
  AIDLCStudioPipeline,
  DataToContentPipeline,
} from "./ResearchPipelineFilms";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AIDLCStudioPipeline"
        component={AIDLCStudioPipeline}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={900}
      />
      <Composition
        id="AgentConversationLoggerPipeline"
        component={AgentConversationLoggerPipeline}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={900}
      />
      <Composition
        id="DataToContentPipeline"
        component={DataToContentPipeline}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={900}
      />
      <Composition
        id="AgenticTaskAutomationPipeline"
        component={AgenticTaskAutomationPipeline}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={900}
      />
    </>
  );
};
