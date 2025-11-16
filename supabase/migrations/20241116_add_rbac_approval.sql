-- Add RBAC and approval workflow to users table
ALTER TABLE users ADD COLUMN role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user';
ALTER TABLE users ADD COLUMN approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN approved_by TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN approved_at INTEGER;

-- Update existing users to approved status (for backward compatibility)
UPDATE users SET approval_status = 'approved', approved_at = created_at WHERE approval_status = 'pending';

-- Create index for efficient queries on approval status
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_approved_by ON users(approved_by);

-- Add approval audit table for tracking approval history
CREATE TABLE approval_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
  performed_by TEXT NOT NULL REFERENCES users(id),
  reason TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_approval_history_user_id ON approval_history(user_id);
CREATE INDEX idx_approval_history_performed_by ON approval_history(performed_by);