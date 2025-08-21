<?php

namespace App\Exports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;


class PurchaseOrdersImportTemplateExport implements FromArray, WithHeadings, WithEvents
{
    public function array(): array
    {
        return [
            ['Sample Product', now()->format('Y-m-d H:i'), 10000, 1, 'draft', 'Sample Warehouse'],
        ];
    }

    public function headings(): array
    {
        return ['Product Name', 'Order Date', 'Price', 'Quantity', 'Status', 'Warehouse (If status is completed)'];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $spreadsheet = $event->sheet->getParent();
                $sheet = $event->sheet->getDelegate();

                // Mengambil data dari DB
                $products = Product::pluck('name')->toArray();
                $warehouses = Warehouse::pluck('name')->toArray();

                // Membuat sheet hidden untuk data dropdown
                $hiddenSheet = $spreadsheet->createSheet();
                $hiddenSheet->setTitle('DataList');

                // Memasukkan product ke kolom A
                foreach ($products as $i => $name) {
                    $hiddenSheet->setCellValue("A" . ($i + 1), $name);
                }
                // Memasukkan warehouse ke kolom B
                foreach ($warehouses as $i => $name) {
                    $hiddenSheet->setCellValue("B" . ($i + 1), $name);
                }
                // Menyembunyikan sheet
                $hiddenSheet->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);

                // Dropdown product
                for ($row = 2; $row <= 100; $row++) {
                    $this->addDropdown($sheet, "A$row", 'DataList!$A$1:$A$' . count($products));
                }
                // Dropdown warehouse
                for ($row = 2; $row <= 100; $row++) {
                    $this->addDropdown($sheet, "F$row", 'DataList!$B$1:$B$' . count($warehouses));
                }

                // Dropdown status
                $statusOptions = ['draft', 'confirmed', 'completed'];
                $statusRange = '"' . implode(',', $statusOptions) . '"';
                for ($row = 2; $row <= 100; $row++) {
                    $this->addDropdown($sheet, "E$row", $statusRange);
                }

                // Styling
                $sheet->getStyle('A1:F1')->getFont()->setBold(true);
                foreach (range('A', 'E') as $col) {
                    $sheet->getColumnDimension($col)->setWidth(20);
                }
                $sheet->getColumnDimension('F')->setWidth(40);
                $sheet->getStyle('A1:F1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('A1:F1')->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $sheet->getStyle('A1:F1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
                $sheet->getStyle('A1:F1')->getFill()->getStartColor()->setARGB('FFCCCCCC');

                // Wrap text untuk semua cell isi
                $sheet->getStyle('A2:F100')->getAlignment()->setWrapText(true);
                $sheet->getDefaultRowDimension()->setRowHeight(-1); // auto height
                $sheet->getStyle('A1:F100')->getFont()->setName('Trebuchet MS');

                $sheet->getStyle('F1')->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFFFFF99');
                $sheet->getStyle("B2:B100")
                    ->getNumberFormat()
                    ->setFormatCode('yyyy-mm-dd hh:mm');
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
