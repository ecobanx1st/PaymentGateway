<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCmsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('cms', function (Blueprint $table) {
            $table->increments('id');
            $table->text('privacy_policy')->nullable();
            $table->text('tc')->nullable();
            $table->text('aboutus')->nullable();
            $table->text('logo')->nullable();
            $table->text('favicon')->nullable();
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
        Schema::dropIfExists('cms');
    }
}
