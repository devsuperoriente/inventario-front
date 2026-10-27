export function normalizeProductionOrderStateName(name) {
  return String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isOrderInProductionState(order, states, targetStateName) {
  const targetName = normalizeProductionOrderStateName(targetStateName);
  const orderStateId = String(order?.state?.id ?? order?.stateId ?? "");
  const stateFromApi = Array.isArray(states)
    ? states.find((state) => String(state.id) === orderStateId)
    : undefined;
  const stateName =
    stateFromApi?.name ?? order?.state?.name ?? order?.stateName;

  return normalizeProductionOrderStateName(stateName).includes(targetName);
}
