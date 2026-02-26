<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBuyerInformationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('buyer_informations', function (Blueprint $table) {
            $table->increments('id');            
            $table->integer('oid')->unsigned();
            $table->foreign('oid')->references('id')->on('order_transactions');
            $table->string('first_name',90);
            $table->string('last_name',90);
            $table->string('company',90)->nullable();
            $table->string('email',90);
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
        Schema::dropIfExists('buyer_informations');
    }
}
