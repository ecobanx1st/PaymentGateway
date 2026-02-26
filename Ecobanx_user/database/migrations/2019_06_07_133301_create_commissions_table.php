<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCommissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->increments('id');            
            $table->text('source')->nullable();
            $table->integer('limit')->nullable();
            $table->double('min_amount')->nullable();
            $table->double('max_amount')->nullable();
            $table->double('verified')->nullable();
            $table->float('withdraw',5,2)->nullable();
            $table->enum('type', ['fiat','coin','token']);
            $table->string('coinname')->nullable();
            $table->double('netfee')->nullable();
            $table->integer('point_value')->nullable();
            $table->text('url')->nullable();
            $table->boolean('status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('commissions');
    }
}
