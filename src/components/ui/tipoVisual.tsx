import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import SavingsIcon from '@mui/icons-material/SavingsOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { Tipo } from '../../types';
import { tipoColors } from '../../theme/tokens';

export const tipoIcon: Record<Tipo, SvgIconComponent> = {
  Ingreso: PaymentsIcon,
  Fijo: ReceiptLongIcon,
  Necesario: ShoppingCartIcon,
  Deuda: CreditCardIcon,
  Ahorro: SavingsIcon,
  Situacional: BoltIcon,
};

export const tipoColor = tipoColors;
