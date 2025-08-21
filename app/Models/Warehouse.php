<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Warehouse extends Model implements Auditable
{
    use HasFactory, HasUuids, SoftDeletes, AuditableTrait;

    protected $fillable = ['name', 'location', 'is_active'];

    protected $casts = [
        'location' => 'array',
        'is_active' => 'boolean',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_warehouse')
            ->using(ProductWarehouse::class)
            ->withPivot('stock')
            ->withTimestamps();
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}