
import { MillSettings, PaymentMethod, TankType } from '@/types';

interface CalculationResult {
  returnAmount: {
    oil: number;
    cash: number;
  };
  tanksPayment: {
    oil: number;
    cash: number;
  };
  total: {
    oil: number;
    cash: number;
  };
}

export const calculateInvoice = (
  oilAmount: number,
  tanks: TankType[],
  paymentMethod: PaymentMethod,
  settings: MillSettings
): CalculationResult => {
  // Initialize the result object
  const result: CalculationResult = {
    returnAmount: { oil: 0, cash: 0 },
    tanksPayment: { oil: 0, cash: 0 },
    total: { oil: 0, cash: 0 },
  };

  // Calculate total tank price
  const totalTankPrice = tanks.reduce((sum, tank) => {
    const price = tank.type === 'plastic' 
      ? settings.tankPrices.plastic 
      : settings.tankPrices.metal;
    return sum + (price * tank.count);
  }, 0);

  // Calculations based on payment method
  if (paymentMethod === 'oil') {
    // Return in oil
    result.returnAmount.oil = (oilAmount * settings.oilReturnPercentage) / 100;
    
    // Tank payment in oil equivalent
    result.tanksPayment.oil = totalTankPrice / settings.oilBuyPrice;
    
    // Total in oil
    result.total.oil = result.returnAmount.oil + result.tanksPayment.oil;
  } 
  else if (paymentMethod === 'cash') {
    // Return in cash
    result.returnAmount.cash = oilAmount * settings.cashReturnPrice;
    
    // Tank payment in cash
    result.tanksPayment.cash = totalTankPrice;
    
    // Total in cash
    result.total.cash = result.returnAmount.cash + result.tanksPayment.cash;
  } 
  else if (paymentMethod === 'mixed') {
    // Return in oil
    result.returnAmount.oil = (oilAmount * settings.oilReturnPercentage) / 100;
    
    // Tank payment in cash
    result.tanksPayment.cash = totalTankPrice;
    
    // Total split between oil and cash
    result.total.oil = result.returnAmount.oil;
    result.total.cash = result.tanksPayment.cash;
  }

  // Round values to 2 decimal places
  result.returnAmount.oil = Number(result.returnAmount.oil.toFixed(2));
  result.returnAmount.cash = Number(result.returnAmount.cash.toFixed(2));
  result.tanksPayment.oil = Number(result.tanksPayment.oil.toFixed(2));
  result.tanksPayment.cash = Number(result.tanksPayment.cash.toFixed(2));
  result.total.oil = Number(result.total.oil.toFixed(2));
  result.total.cash = Number(result.total.cash.toFixed(2));

  return result;
};
