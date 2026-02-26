<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Apicategory extends Model
{
    protected $table ='api_category';


    public static function index()
    {
    	$forum = Apicategory::get();

    	return $forum;
    }



  }
