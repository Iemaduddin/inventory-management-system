<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Permissions
        $permissions = [
            // User Management
            'user.view',
            'user.create',
            'user.edit',
            'user.delete',

            // Role Management
            'role.view',
            'role.create',
            'role.edit',
            'role.delete',

            // Supplier
            'supplier.view',
            'supplier.create',
            'supplier.edit',
            'supplier.delete',

            // Product
            'product.view',
            'product.create',
            'product.edit',
            'product.delete',

            // Stock Movement
            'stock_movement.view',
            'stock_movement.create',
            'stock_movement.edit',
            'stock_movement.delete',

            // Category
            'category.view',
            'category.create',
            'category.edit',
            'category.delete',

            // Warehouse
            'warehouse.view',
            'warehouse.create',
            'warehouse.edit',
            'warehouse.delete',

            // Purchase Order
            'purchase_order.view',
            'purchase_order.create',
            'purchase_order.edit',
            'purchase_order.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                [
                    'uuid' => Str::uuid(),
                    'name' => $permission,
                    'guard_name' => 'web',
                ]
            );
        }
        // Roles
        $adminRole = Role::firstOrCreate(['uuid' => Str::uuid(), 'name' => 'Administrator']);
        $managerRole = Role::firstOrCreate(['uuid' => Str::uuid(), 'name' => 'Manager']);
        $staffRole = Role::firstOrCreate(['uuid' => Str::uuid(), 'name' => 'Staff']);

        // Admin user
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole($adminRole['name']);
        // $admin->givePermissionTo([
        //     'user.view',
        //     'user.create',
        //     'user.edit',
        //     'user.delete',
        //     'role.view',
        //     'role.create',
        //     'role.edit',
        //     'role.delete',
        //     'supplier.view',
        //     'supplier.create',
        //     'supplier.edit',
        //     'supplier.delete',
        //     'product.view',
        //     'product.create',
        //     'product.edit',
        //     'product.delete',
        //     'stock_movement.view',
        //     'stock_movement.create',
        //     'stock_movement.edit',
        //     'stock_movement.delete',
        //     'category.view',
        //     'category.create',
        //     'category.edit',
        //     'category.delete',
        //     'warehouse.view',
        //     'warehouse.create',
        //     'warehouse.edit',
        //     'warehouse.delete',
        //     'purchase_order.view',
        //     'purchase_order.create',
        //     'purchase_order.edit',
        //     'purchase_order.delete'
        // ]);
        // // Assign permissions to manager roles
        // $managerRole->givePermissionTo([
        //     'user.view',
        //     'user.create',
        //     'user.edit',
        //     'user.delete',
        //     'supplier.view',
        //     'supplier.create',
        //     'supplier.edit',
        //     'supplier.delete',
        //     'product.view',
        //     'product.create',
        //     'product.edit',
        //     'product.delete',
        //     'stock_movement.view',
        //     'stock_movement.create',
        //     'stock_movement.edit',
        //     'stock_movement.delete',
        //     'category.view',
        //     'category.create',
        //     'category.edit',
        //     'category.delete',
        //     'warehouse.view',
        //     'warehouse.create',
        //     'warehouse.edit',
        //     'warehouse.delete'
        // ]);

        // // Assign permissions to staff roles
        // $staffRole->givePermissionTo([
        //     'user.view',
        //     'supplier.view',
        //     'product.view',
        //     'stock_movement.view',
        //     'category.view',
        //     'warehouse.view',
        //     'purchase_order.view'
        // ]);

        // Manager users
        User::factory()->count(2)->create()->each(function ($u) use ($managerRole) {
            $u->assignRole($managerRole['name']);
        });
        // Staff users
        User::factory()->count(2)->create()->each(function ($u) use ($staffRole) {
            $u->assignRole($staffRole['name']);
        });
    }
}