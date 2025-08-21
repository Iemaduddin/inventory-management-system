<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProductWarehouse extends Pivot implements Auditable
{
    use HasUuids, AuditableTrait;

    protected $table = 'product_warehouse';
    protected $fillable = ['product_id', 'warehouse_id', 'stock'];
}