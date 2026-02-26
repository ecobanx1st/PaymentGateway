<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateShippingInformationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shipping_informations', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('oid')->unsigned();
            $table->foreign('oid')->references('id')->on('order_transactions');
            $table->string('address1',160);
            $table->string('address2',160);
            $table->string('city',50);
            $table->string('state',50);
            $table->string('zip',10);
            $table->string('country_name',30);
            $table->string('phone',15);
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
        Schema::dropIfExists('shipping_informations');
    }
}
