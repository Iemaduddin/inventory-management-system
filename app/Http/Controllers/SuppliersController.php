<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Audit;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Exports\SuppliersExport;
use App\Imports\SuppliersImport;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class SuppliersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers = Supplier::all();
        return Inertia::render('SuppliersManagement', [
            'suppliers' => $suppliers,
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
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:500',
            'is_active' => 'boolean',
        ]);
        // Prepare contact information as a JSON string
        $contact_info = json_encode([
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
        ]);

        // Handle file upload if a document is provided
        if ($request->hasFile('document_path')) {
            // Validate the file size and type
            $request->validate([
                'document_path' => 'file|mimes:pdf|between:100,500', // Ensure the file is a PDF and between 100KB and 500KB
            ]);
            $documentName = $request->name . '-' . time();
            $documentPath = $request->file('document_path')->storeAs(
                'Documents/Suppliers',
                $documentName . '.' . $request->file('document_path')->getClientOriginalExtension(),
                'public'
            );
            $validated['document_path'] = $documentPath;
        } else {
            $validated['document_path'] = null;
        }
        // Create the supplier with the validated data
        Supplier::create([
            'name' => $validated['name'],
            'contact_info' => $contact_info,
            'document_path' => $validated['document_path'],
            'is_active' => $validated['is_active'],
        ]);
        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $Supplier)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $Supplier)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:500',
            'is_active' => 'boolean',
        ]);
        // Prepare contact information as a JSON string
        $contact_info = json_encode([
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'address' => $request->input('address'),
        ]);
        // Handle file upload if a document is provided
        if ($request->hasFile('document_path')) {
            $request->validate([
                'document_path' => 'file|mimes:pdf|between:100,500', // 100KB - 500KB
            ]);

            if ($supplier->document_path && Storage::disk('public')->exists($supplier->document_path)) {
                Storage::disk('public')->delete($supplier->document_path);
            }

            $documentName = $request->name . '-' . time();
            $documentPath = $request->file('document_path')->storeAs(
                'Documents/Suppliers',
                $documentName . '.' . $request->file('document_path')->getClientOriginalExtension(),
                'public'
            );

            $validated['document_path'] = $documentPath;
            $supplier->document_path = $documentPath;
        } else {
            unset($validated['document_path']);
        }
        // Update the supplier with the validated data
        $supplier->update([
            'name' => $validated['name'],
            'contact_info' => $contact_info,
            'is_active' => $validated['is_active'],
        ]);
        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $Supplier)
    {
        $Supplier->delete();
        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }

    public function startExport(Request $request)
    {
        $order = ['name', 'contact_info', 'is_active'];


        $inputFields = $request->input('fields', ['name']);

        $fields = array_values(array_intersect($order, $inputFields));
        $fileName = 'suppliers_' . now()->format('Ymd_His') . '.xlsx';

        Excel::queue(new SuppliersExport($fields), $fileName, 'public');

        Audit::create([
            'user_id' => Auth::id(),
            'event' => 'exported',
            'auditable_id' => "",
            'auditable_type' => Supplier::class,
            'old_values' => [],
            'new_values' => [],
            'url' => route('suppliers.export.start'),
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
                new SuppliersImport,
                $request->file('file')
            );
            Audit::create([
                'user_id' => Auth::id(),
                'event' => 'imported',
                'auditable_id' => "",
                'auditable_type' => Supplier::class,
                'old_values' => [],
                'new_values' => [],
                'url' => route('suppliers.import'),
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
        $filePath = storage_path('app/public/templates/template-suppliers-import.xlsx');

        if (!file_exists($filePath)) {
            abort(404, 'Template file not found.');
        }

        return response()->download($filePath);
    }
}
