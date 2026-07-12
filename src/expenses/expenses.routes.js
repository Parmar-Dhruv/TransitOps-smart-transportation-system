import { Router } from 'express';
import * as expensesController from './expenses.controller.js';
import { 
  createExpenseSchema, 
  updateExpenseSchema, 
  getExpenseSchema, 
  listExpenseSchema 
} from './expenses.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Allowed roles for finance ledger operations
const ALLOWED_ROLES = ['ADMIN', 'FINANCIAL_ANALYST'];

// Retrieve all ledger expenses (Finance only)
router.get(
  '/',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(listExpenseSchema),
  expensesController.list
);

// Retrieve details for a single ledger expense (Finance only)
router.get(
  '/:id',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(getExpenseSchema),
  expensesController.getOne
);

// Record a new expense ledger entry (Finance only)
router.post(
  '/',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(createExpenseSchema),
  auditLogger('Record Ledger Expense', 'Expense'),
  expensesController.create
);

// Modify details of an expense record (Finance only)
router.patch(
  '/:id',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(updateExpenseSchema),
  auditLogger('Modify Ledger Expense', 'Expense'),
  expensesController.update
);

// Delete an expense record (Finance only)
router.delete(
  '/:id',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(getExpenseSchema),
  auditLogger('Delete Ledger Expense', 'Expense'),
  expensesController.remove
);

export default router;
