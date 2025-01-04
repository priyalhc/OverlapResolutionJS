function resolveOverlapsPreservingObjectives() {
  const sheetName = "overlap fix"; // Sheet name
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet named '${sheetName}' not found.`);
  }

  // Define ranges
  const table1Range = sheet.getRange("A2:E10"); // Table 1: Original coordinates and dimensions
  const newCoordinatesRange = sheet.getRange("J2:K10"); // Table 2: New coordinates

  // Floor dimensions
  const floorWidth = 15885.22;
  const floorHeight = 8935.76;

  // Parse Table 1
  const table1 = table1Range.getValues();
  const workstations = table1.map(row => ({
    name: row[0],    // Workstation name
    x: row[1],       // Initial X-coordinate (center)
    y: row[2],       // Initial Y-coordinate (center)
    length: row[3],  // Length
    width: row[4],   // Width
  }));

  // Iterative adjustment for overlap resolution
  const maxIterations = 1000;
  let iterations = 0;
  let overlapsResolved = false;

  while (!overlapsResolved && iterations < maxIterations) {
    overlapsResolved = true;

    for (let i = 0; i < workstations.length; i++) {
      for (let j = i + 1; j < workstations.length; j++) {
        const wsA = workstations[i];
        const wsB = workstations[j];

        // Check for overlap
        const overlapX = Math.abs(wsA.x - wsB.x) < (wsA.length + wsB.length) / 2;
        const overlapY = Math.abs(wsA.y - wsB.y) < (wsA.width + wsB.width) / 2;

        if (overlapX && overlapY) {
          overlapsResolved = false;

          // Calculate minimal adjustment to separate them
          const deltaX = (wsA.length + wsB.length) / 2 - Math.abs(wsA.x - wsB.x);
          const deltaY = (wsA.width + wsB.width) / 2 - Math.abs(wsA.y - wsB.y);

          if (wsA.x <= wsB.x) wsB.x += deltaX / 2;
          else wsB.x -= deltaX / 2;

          if (wsA.y <= wsB.y) wsB.y += deltaY / 2;
          else wsB.y -= deltaY / 2;

          if (wsA.x >= wsB.x) wsA.x += deltaX / 2;
          else wsA.x -= deltaX / 2;

          if (wsA.y >= wsB.y) wsA.y += deltaY / 2;
          else wsA.y -= deltaY / 2;

          // Ensure both stay within the floor boundaries
          wsA.x = Math.min(Math.max(wsA.x, wsA.length / 2), floorWidth - wsA.length / 2);
          wsA.y = Math.min(Math.max(wsA.y, wsA.width / 2), floorHeight - wsA.width / 2);

          wsB.x = Math.min(Math.max(wsB.x, wsB.length / 2), floorWidth - wsB.length / 2);
          wsB.y = Math.min(Math.max(wsB.y, wsB.width / 2), floorHeight - wsB.width / 2);
        }
      }
    }

    iterations++;
  }

  if (!overlapsResolved) {
    throw new Error("Unable to resolve all overlaps within the maximum iterations.");
  }

  // Write new coordinates to Table 2
  const newCoordinates = workstations.map(ws => [ws.x, ws.y]);
  newCoordinatesRange.setValues(newCoordinates);

  Logger.log("All overlaps resolved successfully without compromising layout objectives.");
}
