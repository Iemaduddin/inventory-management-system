<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Audit;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use App\Exports\WarehousesExport;
use App\Imports\WarehousesImport;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class WarehousesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $warehouses = Warehouse::all();
        return Inertia::render('WarehousesManagement', [
            'warehouses' => $warehouses,
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'is_active' => 'boolean',
        ]);
        // Prepare contact information as a JSON string
        $location = json_encode([
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
        ]);

        // Create the supplier with the validated data
        Warehouse::create([
            'name' => $validated['name'],
            'location' => $location,
            'is_active' => $validated['is_active'],
        ]);
        return redirect()->back()->with('success', 'Warehouse created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'is_active' => 'boolean',
        ]);
        // Prepare location info as a JSON string
        $location = json_encode([
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
        ]);

        // Create the warehouse  with the validated data
        $warehouse->update([
            'name' => $validated['name'],
            'location' => $location,
            'is_active' => $validated['is_active'],
        ]);
        return redirect()->back()->with('success', 'Warehouse updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Warehouse $warehouse)
    {
        // Delete the warehouse
        $warehouse->delete();
        return redirect()->back()->with('success', 'Warehouse deleted successfully.');
    }
    public function startExport(Request $request)
    {
        $order = ['name', 'location', 'is_active'];


        $inputFields = $request->input('fields', ['name']);

        $fields = array_values(array_intersect($order, $inputFields));
        $fileName = 'warehouses_' . now()->format('Ymd_His') . '.xlsx';

        Excel::queue(new WarehousesExport($fields), $fileName, 'public');

        Audit::create([
            'user_id' => Auth::id(),
            'event' => 'exported',
            'auditable_id' => "",
            'auditable_type' => Warehouse::class,
            'old_values' => [],
            'new_values' => [],
            'url' => route('warehouses.export.start'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => 'queued',
            'file' => $fileName
        ]);
    }

    public function checkExportStatus($fileName)
    {
        $path = storage_path("app/public/{$fileName}");

        if (file_exists($path)) {
            return response()->json([
                'ready' => true,
                'url' => asset("storage/{$fileName}")
            ]);
        }

        return response()->json(['ready' => false]);
    }
    public function downloadAndDelete($fileName)
    {
        $path = storage_path("app/public/{$fileName}");

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->download($path)->deleteFileAfterSend(true);
    }
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            // Queue import
            Excel::queueImport(
                new WarehousesImport,
                $request->file('file')
            );
            Audit::create([
                'user_id' => Auth::id(),
                'event' => 'imported',
                'auditable_id' => "",
                'auditable_type' => Warehouse::class,
                'old_values' => [],
                'new_values' => [],
                'url' => route('warehouses.import'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json([
                'status' => 'queued',
                'message' => 'Import has been queued successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }
    public function downloadTemplate()
    {
        $filePath = storage_path('app/public/templates/template-warehouses-import.xlsx');

        if (!file_exists($filePath)) {
            abort(404, 'Template file not found.');
        }

        return response()->download($filePath);
    }
}
