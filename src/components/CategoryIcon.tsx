
import React from 'react';
import { 
  DollarSign, 
  Car, 
  ShoppingBag, 
  Utensils, 
  Heart, 
  Euro, 
  IndianRupee, 
  Receipt, 
  Home,
  Gamepad2,
  Plane,
  GraduationCap,
  Stethoscope,
  Shirt,
  Gift,
  Coffee,
  Fuel,
  Bus,
  CreditCard,
  Briefcase,
  Music,
  Camera,
  Dumbbell,
  MapPin
} from 'lucide-react';

export const CATEGORY_ICONS = {
  'dollar-sign': DollarSign,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'heart': Heart,
  'euro': Euro,
  'inr': IndianRupee,
  'receipt': Receipt,
  'home': Home,
  'gamepad-2': Gamepad2,
  'plane': Plane,
  'graduation-cap': GraduationCap,
  'stethoscope': Stethoscope,
  'shirt': Shirt,
  'gift': Gift,
  'coffee': Coffee,
  'fuel': Fuel,
  'bus': Bus,
  'credit-card': CreditCard,
  'briefcase': Briefcase,
  'music': Music,
  'camera': Camera,
  'dumbbell': Dumbbell,
  'map-pin': MapPin
};

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  size?: number;
  color?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName = 'dollar-sign', 
  className = '', 
  size = 16,
  color 
}) => {
  const IconComponent = CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || DollarSign;
  
  return (
    <IconComponent 
      className={className} 
      size={size} 
      color={color}
    />
  );
};

export default CategoryIcon;
