    const approvals = (await this.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM approvals WHERE status = 'pending'`,
    ).first()) as { count: number } | null;