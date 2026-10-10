// Простое глобальное хранилище выбора машины (между сценами).
// В черновом проекте без бэкенда — достаточно registry + localStorage.
import { getCarById } from '../config/carCatalog.js';

const LS_KEY = 'top_racer_selected_car';

export function saveSelectedCar(carId) {
  try { localStorage.setItem(LS_KEY, carId); } catch (e) { /* приватный режим */ }
}

export function loadSelectedCarId() {
  try { return localStorage.getItem(LS_KEY); } catch (e) { return null; }
}

export function getSelectedCar() {
  return getCarById(loadSelectedCarId());
}

export function setSelectedCarInRegistry(registry) {
  const car = getSelectedCar();
  registry.set('selectedCar', car);
  return car;
}
