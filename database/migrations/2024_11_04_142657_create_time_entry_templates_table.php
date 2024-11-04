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
        Schema::create('time_entry_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignUuid('mite_access_id')->constrained()->cascadeOnDelete();

            $table->unique(['name', 'mite_access_id']);
        });

        Schema::create('time_entry_template_contents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->foreignUuid('time_entry_template_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete()->nullable();
            $table->foreignUuid('service_id')->constrained()->cascadeOnDelete()->nullable();
            $table->string('note')->nullable();
            $table->integer('minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_entry_template_contents');
        Schema::dropIfExists('time_entry_templates');
    }
};
