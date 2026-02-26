<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSupportchatsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
     public function up()
    {
       Schema::create('supportchats', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('uid')->unsigned();
            $table->foreign('uid')->references('id')->on('users');
            $table->text('ticketid')->nullable();
            $table->text('message')->nullable();
            $table->text('reply')->nullable();
            $table->integer('user_status')->default(0);
            $table->integer('admin_status')->default(0);
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
        Schema::dropIfExists('supportchats');
    }
}
