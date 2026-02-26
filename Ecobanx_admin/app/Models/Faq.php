<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    public static function saveFaq($request)
    {
    	$features = new Faq();
    	$features->setConnection('mysql2');
        $features->heading = $request->heading;
        $features->desc = $request->description;
        $features->save(); 

        return true;
    }

    public static function edit($id)
    {
    	$faq = Faq::on('mysql2')->where('id',$id)->first(); 

    	return $faq;
    }

    public static function faqUpdate($request)
    {
    	$features = Faq::on('mysql2')->where('id',$request->id)->first();
        $features->heading = $request->heading;
        $features->desc = $request->description;
        $features->save(); 

        return $faq='Updated Successfully';
    }

    public static function destroy($id)
    {
        $faq = Faq::on('mysql2')->where('id',$id)->first(); 
        if($faq){
           Faq::on('mysql2')->where('id',$id)->delete();
           return 'Record deleted Successfully!';  
        }else{
            return false;
        }
        
    }
}
