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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(Str::uuid());
            $table->uuid('purchase_order_id');
            $table->uuid('product_id');
            $table->integer('quantity');
            $table->decimal('price', 12, 2);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders');
            $table->foreign('product_id')->references('id')->on('products');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};