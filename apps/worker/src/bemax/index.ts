      const item = evidenceService.collect(
        String(body.entityId ?? "unknown"),
        String(body.source ?? "portal"),
        String(body.metric ?? "status"),
        typeof body.value === "number" || typeof body.value === "string" ? body.value : 0,
      );