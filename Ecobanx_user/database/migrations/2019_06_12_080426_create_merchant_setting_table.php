<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMerchantSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('merchant_setting', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('uid')->nullable();
            $table->string('ipn_secret')->nullable();
            $table->string('ipn_url')->nullable();
            $table->string('coin')->nullable();
            $table->string('receive_mail')->nullable();
            $table->string('status_email')->nullable();
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
        Schema::dropIfExists('merchant_setting');
    }
}
