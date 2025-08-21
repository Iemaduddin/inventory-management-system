<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class StockMovement extends Model implements Auditable
{
    use HasUuids, SoftDeletes, AuditableTrait;

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'movement_type',
        'movement_reason',
        'quantity',
        'notes',
        'movement_date'
    ];

    protected $casts = [
        'movement_date' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}