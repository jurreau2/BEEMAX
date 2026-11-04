    const effectiveHandler = handler ?? (typeof adapter === "function" ? adapter as (...args: any[]) => any : undefined);

    if (!manifest.id.trim()) throw new TypeError("adapter id is required");
    if (!manifest.version.trim()) throw new TypeError("adapter version is required");
    if (manifest.identityAnchor !== SOVEREIGN_IDENTITY_ANCHOR)
      throw new Error("Adapter rejected: invalid identity anchor");
    if (this.registrations.has(manifest.id))
      throw new Error(`Adapter collision detected for ID: ${manifest.id}`);
    const entry: RegistryEntry = {
      manifest: Object.freeze({ ...manifest }),
      state,
      adapter,
      ...(effectiveHandler ? { handler: effectiveHandler } : {}),
    };
    this.registrations.set(manifest.id, Object.freeze(entry));