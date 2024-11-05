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
            $table->foreignUuid('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUuid('service_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('note')->nullable();
            $table->integer('minutes');
        });

        Schema::table("entries", function (Blueprint $table) {
            $table->foreignUuid('time_entry_template_content_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("entries", function(Blueprint $table){
            $table->dropConstrainedForeignId('time_entry_template_content_id');
            $table->dropColumn('time_entry_template_content_id');
        });
        Schema::dropIfExists('time_entry_template_contents');
        Schema::dropIfExists('time_entry_templates');
    }
};
