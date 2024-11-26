<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('entry_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('entry_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('template_id')->constrained()->onDelete('cascade');
            $table->boolean('applied')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_templates');
    }
};
