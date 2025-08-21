<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Http\Request;

class RolesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::orderBy('created_at', 'asc')->get();

        return inertia('RolesManagement', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
        ]);
        // Check if the role already exists
        if (Role::where('name', $request->name)->exists()) {
            return redirect()->route('roles.index')->with('error', 'Role already exists.');
        }

        Role::create([
            'name' => $request->name,
        ]);

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */


    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->uuid . ',uuid',
        ]);

        // Check if the role already exists
        if (Role::where('name', $request->name)->where('uuid', '!=', $role->uuid)->exists()) {
            return redirect()->route('roles.index')->with('error', 'Role already exists.');
        }

        $role->update([
            'name' => $request->name,
        ]);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->name === 'Administrator') {
            return redirect()->route('roles.index')->with('error', 'Cannot delete the Administrator role.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
