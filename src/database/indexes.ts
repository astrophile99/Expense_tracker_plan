export const indexes = `
-- =====================================================
-- Performance Indexes for Finance Tracker
-- =====================================================

-- ────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- ────────────────────────────────────────
-- WORKSPACE MEMBERS
-- ────────────────────────────────────────
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON public.workspace_members(role);
CREATE INDEX idx_workspace_members_workspace_user ON public.workspace_members(workspace_id, user_id);

-- ────────────────────────────────────────
-- WORKSPACE INVITATIONS
-- ────────────────────────────────────────
CREATE INDEX idx_workspace_invitations_workspace ON public.workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations(email);
CREATE INDEX idx_workspace_invitations_status ON public.workspace_invitations(status);
CREATE INDEX idx_workspace_invitations_expires ON public.workspace_invitations(expires_at)
  WHERE status = 'pending';

-- ────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────
CREATE INDEX idx_categories_workspace_id ON public.categories(workspace_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_group ON public.categories(group);
CREATE INDEX idx_categories_is_default ON public.categories(is_default)
  WHERE is_default = TRUE;
CREATE INDEX idx_categories_workspace_default ON public.categories(workspace_id, is_default);

-- ────────────────────────────────────────
-- TRANSACTIONS - Primary lookup indexes
-- ────────────────────────────────────────
CREATE INDEX idx_transactions_created_by ON public.transactions(created_by);
CREATE INDEX idx_transactions_workspace_id ON public.transactions(workspace_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date DESC);

-- Transaction filter indexes
CREATE INDEX idx_transactions_visibility ON public.transactions(visibility);
CREATE INDEX idx_transactions_payment_method ON public.transactions(payment_method);
CREATE INDEX idx_transactions_is_reconciled ON public.transactions(is_reconciled)
  WHERE is_reconciled = FALSE;

-- Composite indexes for common query patterns
CREATE INDEX idx_transactions_user_date ON public.transactions(created_by, transaction_date DESC);
CREATE INDEX idx_transactions_workspace_date ON public.transactions(workspace_id, transaction_date DESC);
CREATE INDEX idx_transactions_type_date ON public.transactions(type, transaction_date DESC);
CREATE INDEX idx_transactions_category_date ON public.transactions(category_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions(created_by, type);
CREATE INDEX idx_transactions_visibility_workspace ON public.transactions(workspace_id, visibility)
  WHERE visibility = 'workspace';

-- GIN index for tag search
CREATE INDEX idx_transactions_tags ON public.transactions USING GIN(tags);

-- Text search index for description and notes
CREATE INDEX idx_transactions_search ON public.transactions
  USING GIN(to_tsvector('english', description || ' ' || COALESCE(notes, '')));

-- ────────────────────────────────────────
-- RECURRING TRANSACTIONS
-- ────────────────────────────────────────
CREATE INDEX idx_recurring_created_by ON public.recurring_transactions(created_by);
CREATE INDEX idx_recurring_workspace ON public.recurring_transactions(workspace_id);
CREATE INDEX idx_recurring_next_execution ON public.recurring_transactions(next_execution)
  WHERE is_active = TRUE AND is_paused = FALSE AND deleted_at IS NULL;
CREATE INDEX idx_recurring_active ON public.recurring_transactions(is_active, is_paused, deleted_at);
CREATE INDEX idx_recurring_category ON public.recurring_transactions(category_id);

-- ────────────────────────────────────────
-- BUDGETS
-- ────────────────────────────────────────
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_workspace_id ON public.budgets(workspace_id);
CREATE INDEX idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX idx_budgets_period ON public.budgets(period);
CREATE INDEX idx_budgets_user_period ON public.budgets(user_id, period);
CREATE INDEX idx_budgets_active ON public.budgets(start_date, end_date)
  WHERE end_date IS NULL OR end_date >= CURRENT_DATE;

-- ────────────────────────────────────────
-- ACTIVITY LOGS
-- ────────────────────────────────────────
CREATE INDEX idx_activity_logs_workspace ON public.activity_logs(workspace_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_workspace_created ON public.activity_logs(workspace_id, created_at DESC);

-- ────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read)
  WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- ────────────────────────────────────────
-- MAINTENANCE
-- ────────────────────────────────────────
-- Regularly run: REINDEX DATABASE finance_tracker;
-- Regularly run: ANALYZE;
`;
