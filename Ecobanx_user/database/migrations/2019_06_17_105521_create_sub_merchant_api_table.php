<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSubMerchantApiTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sub_merchant_api', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('cat_id')->unsigned();
            $table->foreign('cat_id')->references('id')->on('api_category');
            $table->string('sub_title')->nullable();
            $table->text('desc')->nullable();
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
        Schema::dropIfExists('sub_merchant_api');
    }
}
