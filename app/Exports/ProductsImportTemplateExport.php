<?php

namespace App\Exports;

use App\Models\Supplier;
use App\Models\Category;
use App\Models\Warehouse;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;


class ProductsImportTemplateExport implements FromArray, WithHeadings, WithEvents
{
    public function array(): array
    {
        return [
            ['Product Example', '10000', '{"color":"black","weight:":"3kg"}', '', '', '', '100']
        ];
    }

    public function headings(): array
    {
        return ['Product Name', 'Price', 'Specifications', 'Supplier', 'Category', 'Warehouse', 'Stock'];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $spreadsheet = $event->sheet->getParent();
                $sheet = $event->sheet->getDelegate();

                // Mengambil data dari DB
                $suppliers = Supplier::pluck('name')->toArray();
                $categories = Category::pluck('name')->toArray();
                $warehouses = Warehouse::pluck('name')->toArray();

                // Membuat sheet hidden untuk data dropdown
                $hiddenSheet = $spreadsheet->createSheet();
                $hiddenSheet->setTitle('DataList');

                // Memasukkan supplier ke kolom A
                foreach ($suppliers as $i => $name) {
                    $hiddenSheet->setCellValue("A" . ($i + 1), $name);
                }

                // Memasukkan category ke kolom B
                foreach ($categories as $i => $name) {
                    $hiddenSheet->setCellValue("B" . ($i + 1), $name);
                }

                // Memasukkan warehouse ke kolom C
                foreach ($warehouses as $i => $name) {
                    $hiddenSheet->setCellValue("C" . ($i + 1), $name);
                }

                // Menyembunyikan sheet
                $hiddenSheet->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);

                // Menambahkan dropdown dari hidden sheet (range)
                for ($row = 2; $row <= 100; $row++) {
                    $this->addDropdown($sheet, "D$row", 'DataList!$A$1:$A$' . count($suppliers));   // Supplier
                    $this->addDropdown($sheet, "E$row", 'DataList!$B$1:$B$' . count($categories)); // Category
                    $this->addDropdown($sheet, "F$row", 'DataList!$C$1:$C$' . count($warehouses)); // Warehouse
                }

                // Styling
                $sheet->getStyle('A1:G1')->getFont()->setBold(true);
                foreach (range('A', 'G') as $col) {
                    $sheet->getColumnDimension($col)->setWidth(20);
                }
                $sheet->getStyle('A1:G1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('A1:G1')->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $sheet->getStyle('A1:G1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
                $sheet->getStyle('A1:G1')->getFill()->getStartColor()->setARGB('FFCCCCCC');
                $sheet->getStyle('A1:G100')->getFont()->setName('Trebuchet MS');
            }
        ];
    }

    private function addDropdown($sheet, $cell, $formulaRange)
    {
        $validation = $sheet->getCell($cell)->getDataValidation();
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
        $validation->setAllowBlank(true);
        $validation->setShowDropDown(true);
        $validation->setFormula1($formulaRange);
    }
}
