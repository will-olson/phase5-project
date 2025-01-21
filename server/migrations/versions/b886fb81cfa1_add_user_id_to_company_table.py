"""Add user_id to Company table

Revision ID: b886fb81cfa1
Revises: ae286c93918f
Create Date: 2025-01-21 08:11:26.538605

"""
from alembic import op
import sqlalchemy as sa

revision = 'b886fb81cfa1'
down_revision = 'ae286c93918f'
branch_labels = None
depends_on = None

def upgrade():
    
    with op.batch_alter_table('companies', schema=None) as batch_op:
        
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        
        batch_op.create_foreign_key(
            batch_op.f('fk_companies_user_id_users'),
            'users',
            ['user_id'],
            ['id']
        )

    op.execute("UPDATE companies SET user_id = 1 WHERE user_id IS NULL")

    
    with op.batch_alter_table('companies', schema=None) as batch_op:
        batch_op.alter_column('user_id', nullable=False)


def downgrade():
    
    with op.batch_alter_table('companies', schema=None) as batch_op:
        
        batch_op.drop_constraint(batch_op.f('fk_companies_user_id_users'), type_='foreignkey')
        
        batch_op.drop_column('user_id')
