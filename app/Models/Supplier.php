<?php

namespace App\Models;

use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Auditable as AuditableTrait;


class Supplier extends Model implements Auditable
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory, HasUuids, SoftDeletes, AuditableTrait;

    protected $fillable = ['name', 'contact_info', 'document_path', 'is_active'];

    protected $casts = [
        'contact_info' => 'array',
        'is_active' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}