<?php

namespace App\Models;

use Illuminate\Support\Str;
use OwenIt\Auditing\Contracts\Audit as AuditContract;
use OwenIt\Auditing\Models\Audit as BaseAudit;

class Audit extends BaseAudit implements AuditContract
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'event',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'url',
        'ip_address',
        'user_agent',
        'tags',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'tags' => 'array',
    ];

    public function getOldValuesAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) ?? [] : $value;
    }

    public function getNewValuesAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) ?? [] : $value;
    }
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
    public function user()
    {
        return $this->belongsTo(config('auth.providers.users.model'), 'user_id');
    }
}
