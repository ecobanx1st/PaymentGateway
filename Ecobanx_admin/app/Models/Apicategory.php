<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Apicategory extends Model
{
    protected $connection = 'mysql2';
    protected $table ='api_category';


    public static function index()
    {
    	$forum = Apicategory::paginate(10);

    	return $forum;
    }

    public static function addforum($request)
    {
        $fourm = new Apicategory();
        $fourm->category  = $request->category;
        $fourm->save();
        return true;

    }

    public static function view($id)
    {
        return Apicategory::where('id',$id)->first();

    }

    public static function formupdate($request)
    {
        $fourm = Apicategory::where('id', $request->id)->first();
        $fourm->category  = $request->category;
        $fourm->save();
        return true;   
    }
    public static function catdestroy($id)
    {
       
        $faq = Apicategory::on('mysql2')->where('id',$id)->first(); 
        if($faq){
            Subapicategory::on('mysql2')->where('cat_id',$id)->delete();
           Apicategory::on('mysql2')->where('id',$id)->delete();
           return 'Record deleted Successfully!';  
        }else{
            return false;
        }
        
    }



  }
