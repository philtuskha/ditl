# import os
# import sys
# sys.path.append(os.path.dirname(os.getcwd()))
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
# import django
# django.setup()
    
from selenium import webdriver
import unittest

# browser = webdriver.Chrome('/Users/eyas/Sites/ditl/blog/tests/chromedriver')  # Optional argument, if not specified will search path.
# browser.get('http://localxhome.com:8000')
# 
# assert 'Bay in the Lif' in browser.title, "Browser title was " + browser.title

class NewVisitorTest(unittest.TestCase):  

    def setUp(self):  
        self.browser = webdriver.Chrome('/Users/eyas/Sites/ditl/ftests/chromedriver')

    def tearDown(self):  
        self.browser.quit()

    def test_can_enter_a_new_thread(self):  
        self.browser.get('localxhome.com:8000')

        self.assertIn('Day in the Life', self.browser.title)  
        
        #talk about all the things that the website does/shows from users perspective
        #self.fail('Finish the test!')  

if __name__ == '__main__':  
    unittest.main()  