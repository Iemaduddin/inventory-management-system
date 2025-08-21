<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Audit;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Exports\CategoriesExport;
use App\Imports\CategoriesImport;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class CategoriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::all();
        return Inertia::render('CategoriesManagement', [
            'categories' => $categories,
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
            'description' => 'nullable|string|max:1000',
        ]);

        Category::create($validated);
        return redirect()->back()->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $category->update($validated);
        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }

    public function startExport(Request $request)
    {
        $order = ['name', 'description'];


        $inputFields = $request->input('fields', ['name']);

        $fields = array_values(array_intersect($order, $inputFields));
        $fileName = 'categories_' . now()->format('Ymd_His') . '.xlsx';

        Excel::queue(new CategoriesExport($fields), $fileName, 'public');

        Audit::create([
            'user_id' => Auth::id(),
            'event' => 'exported',
            'auditable_id' => "",
            'auditable_type' => Category::class,
            'old_values' => [],
            'new_values' => [],
            'url' => route('categories.export.start'),
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
                new CategoriesImport,
                $request->file('file')
            );
            Audit::create([
                'user_id' => Auth::id(),
                'event' => 'imported',
                'auditable_id' => "",
                'auditable_type' => Category::class,
                'old_values' => [],
                'new_values' => [],
                'url' => route('categories.import'),
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
        $filePath = storage_path('app/public/templates/template-categories-import.xlsx');

        if (!file_exists($filePath)) {
            abort(404, 'Template file not found.');
        }

        return response()->download($filePath);
    }
}
