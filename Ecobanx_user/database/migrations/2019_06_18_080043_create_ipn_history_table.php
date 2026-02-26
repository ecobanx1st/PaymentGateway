<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateIpnHistoryTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ipn_history', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('uid')->nullable();
            $table->integer('orderid')->nullable();
            $table->string('type')->nullable();
            $table->string('txn_id')->nullable();
            $table->string('status')->nullable();
            $table->string('ipn_url')->nullable();
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
        Schema::dropIfExists('ipn_history');
    }
}
