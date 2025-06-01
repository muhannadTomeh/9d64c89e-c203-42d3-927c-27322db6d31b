
import { MillSettings, TankType, PaymentMethod } from '@/types';

export const calculateInvoice = (
  oilAmount: number,
  tanks: TankType[],
  paymentMethod: PaymentMethod,
  settings: MillSettings
) => {
  const returnPercentage = settings.oilReturnPercentage / 100;
  const oilReturn = oilAmount * returnPercentage;
  
  // Calculate tank costs
  const plasticTanksCount = tanks.find(t => t.type === 'plastic')?.count || 0;
  const metalTanksCount = tanks.find(t => t.type === 'metal')?.count || 0;
  
  const plasticTanksCost = plasticTanksCount * settings.tankPrices.plastic;
  const metalTanksCost = metalTanksCount * settings.tankPrices.metal;
  const totalTanksCost = plasticTanksCost + metalTanksCost;
  
  let returnAmount = { oil: 0, cash: 0 };
  let tanksPayment = { plastic: 0, metal: 0, oil: 0, cash: 0 };
  let total = { oil: 0, cash: 0 };
  
  switch (paymentMethod) {
    case 'oil':
      returnAmount.oil = oilReturn;
      tanksPayment.oil = totalTanksCost / settings.oilSellPrice;
      tanksPayment.plastic = plasticTanksCost / settings.oilSellPrice;
      tanksPayment.metal = metalTanksCost / settings.oilSellPrice;
      total.oil = returnAmount.oil + tanksPayment.oil;
      break;
      
    case 'cash':
      returnAmount.cash = oilReturn * settings.cashReturnPrice;
      tanksPayment.cash = totalTanksCost;
      tanksPayment.plastic = plasticTanksCost;
      tanksPayment.metal = metalTanksCost;
      total.cash = returnAmount.cash + tanksPayment.cash;
      break;
      
    case 'mixed':
      returnAmount.oil = oilReturn;
      tanksPayment.cash = totalTanksCost;
      tanksPayment.plastic = plasticTanksCost;
      tanksPayment.metal = metalTanksCost;
      total.oil = returnAmount.oil;
      total.cash = tanksPayment.cash;
      break;
  }
  
  return {
    returnAmount,
    tanksPayment,
    total
  };
};
