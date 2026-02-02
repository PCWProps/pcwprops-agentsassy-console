# agentsassy control plane

AgentSassy is the control plane for intent, identity, policy, and routing. It is the only decision system and never executes work directly.

## system placement
- Lives under `apps/agentsassy-console`.
- Interfaces with SaaSy Cloud, MCP, AI, Tech, and Support via explicit boundaries.

## layer boundaries
- **Control plane (AgentSassy)**: identity, policy, intent resolution, routing, tool governance.
- **SaaSy Cloud**: auth and tenancy context only.
- **SaaSy MCP**: capability registry and schema exposure only.
- **SaaSy AI**: intent parsing and routing decisions only.
- **SaaSy Tech**: mock execution only for Phase 1.
- **SaaSy Support**: support surface only, no decisions.

## invariants (architecture lock)
- AgentSassy is the only system allowed to make decisions.
- No arrows bypass the control plane.
- SaaSy Apps are execution-only surfaces.
- DLG_STYLE_SYSTEM is the only approved design system.

## mock limitations (phase 1)
- Execution is stubbed; no commerce or supplier systems invoked.
- No customer or pricing intelligence is stored anywhere.
- Tool governance and schemas are local stubs only.

## what it is not
- Not a brand site, commerce runtime, or supplier integration layer.
- Not an execution engine or policy store outside the control plane.
