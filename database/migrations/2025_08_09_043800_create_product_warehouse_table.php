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
        Schema::create('product_warehouse', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(Str::uuid());
            $table->uuid('product_id');
            $table->uuid('warehouse_id');
            $table->integer('stock')->default(0);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('warehouse_id')->references('id')->on('warehouses');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_warehouse');
    }
};