<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSupportticketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
          Schema::create('supporttickets', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('uid')->unsigned();
            $table->foreign('uid')->references('id')->on('users');
            $table->text('ticket_id')->nullable();
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->integer('status')->default(0);
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
        Schema::dropIfExists('supporttickets');
    }
}
