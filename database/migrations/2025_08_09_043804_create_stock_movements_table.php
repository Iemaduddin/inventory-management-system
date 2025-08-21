<?php

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(Str::uuid());
            $table->uuid('product_id');
            $table->uuid('warehouse_id');
            $table->enum('movement_type', ['in', 'out']);
            $table->enum('movement_reason', [
                'purchase',
                'sale',
                'transfer',
                'adjustment',
                'damage'
            ]);
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->dateTime('movement_date');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('warehouse_id')->references('id')->on('warehouses');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};