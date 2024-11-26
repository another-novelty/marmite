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
        Schema::create('templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignUuid('mite_access_id')->constrained()->cascadeOnDelete();
            $table->unique(['name', 'mite_access_id']);
        });

        Schema::create('contents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->foreignUuid('template_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('service_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('minutes');
            $table->time('start_time');
            $table->integer('pause_time')->default(60);
            $table->integer('jitter_minutes')->default(0);
            $table->integer('jitter_increments')->default(15);
            $table->integer('n_activities')->default(3);
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->foreignUuid('content_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('minutes')->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('is_always_active')->default(false);
            $table->boolean('is_random_allowed')->default(false);
            $table->string('cron_expression')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
        Schema::dropIfExists('contents');
        Schema::dropIfExists('templates');
    }
};
