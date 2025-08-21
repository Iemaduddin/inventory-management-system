<?php

namespace App\Models;

use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\StockMovement;
use App\Models\PurchaseOrderItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Product extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasUuids, SoftDeletes, AuditableTrait;

    protected $fillable = [
        'supplier_id',
        'category_id',
        'name',
        'price',
        'specifications',
        'is_active',
        'manual_pdf'
    ];

    protected $casts = [
        'specifications' => 'array',
        'is_active' => 'boolean',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'product_warehouse')
            ->using(ProductWarehouse::class)
            ->withPivot('stock')
            ->withTimestamps();
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function purchaseOrderItems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}